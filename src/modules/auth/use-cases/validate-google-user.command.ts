import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { User } from '@prisma/client';
import { UserRepository } from 'src/infrastructure/user.repository';
import * as bcrypt from 'bcrypt';
import { FileRepository } from 'src/infrastructure/file.repository';

export class ValidateGoogleUserCommand implements ICommand {
  constructor(public readonly googleUserProfile: any) {}
}
@CommandHandler(ValidateGoogleUserCommand)
export class ValidateGoogleUserCommandHandler
  implements ICommandHandler<ValidateGoogleUserCommand, User>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly fileRepository: FileRepository,
  ) {}

  async execute({ googleUserProfile }): Promise<User> {
    const user = await this.userRepository.findUserByEmail(
      googleUserProfile._json.email,
    );

    if (user !== null) {
      return user;
    }

    const hashedPassword = await bcrypt.hash('123123', 10);
    const newUser = await this.userRepository.createNewUser({
      email: googleUserProfile._json.email,
      password: hashedPassword,
    });

    await this.fileRepository.createMainFolder({ userId: newUser.id });

    return newUser;
  }
}

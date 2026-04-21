import { Module } from "@nestjs/common";
import { EmailService } from "./email.service";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [ConfigModule],
    providers: [EmailService],
    exports: [EmailService], // Export EmailService to be used in other modules like AuthModule
})
export class EmailModule {}
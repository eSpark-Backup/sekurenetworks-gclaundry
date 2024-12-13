import { IsString, IsNumber, IsBoolean, IsEnum, IsOptional } from 'class-validator';

export class StatusDto {
    @IsOptional()
    @IsString()
    macId: string | null;

    @IsOptional()
    @IsNumber()
    temperature: number | null;

    @IsOptional()
    @IsNumber()
    scented: number | null;

    @IsOptional()
    @IsNumber()
    unscented: number | null;

    @IsOptional()
    @IsBoolean()
    scented_motor_stuck: boolean | null;

    @IsOptional()
    @IsBoolean()
    unscented_motor_stuck: boolean | null;

    @IsOptional()
    @IsBoolean()
    is_door_open: boolean | null;
}
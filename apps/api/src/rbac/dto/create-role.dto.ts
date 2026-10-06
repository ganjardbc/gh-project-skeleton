import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    example: 'editor',
    description: 'Unique role name (lowercase, underscores)',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @Matches(/^[a-z0-9_]+$/, {
    message:
      'name must only contain lowercase letters, numbers, and underscores',
  })
  name: string;

  @ApiPropertyOptional({
    example: 'Can create and update content',
    description: 'Role description',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreateFavoriteDto {
  @IsNumber()
  @IsNotEmpty()
  spaId: number;
}

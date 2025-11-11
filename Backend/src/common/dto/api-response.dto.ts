import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty({ example: true, description: 'Indicates whether the request was successful.' })
  success: boolean;

  @ApiProperty({ example: 'Operation completed successfully.', description: 'Human readable description of the result.' })
  message: string;

  @ApiProperty({ required: false, description: 'Optional payload returned by the API.' })
  data?: T;

  constructor(partial?: Partial<ApiResponseDto<T>>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}

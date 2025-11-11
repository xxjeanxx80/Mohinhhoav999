import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
export class CustomerResponseDto {
  @ApiProperty({ example: 1, description: 'ID of the customer' })
  @Expose()
  id: number;
  @ApiProperty({ example: 'Nam Nguyen', description: 'Name of the customer' })
  @Expose()
  name: string;
  @ApiProperty({ example: 'nam@example.com', description: 'Email of the customer' })
  @Expose()
  email: string;
  @ApiProperty({ example: '+84123456789', description: 'Phone number of the customer', required: false })
  @Expose()
  phone?: string;
  @ApiProperty({ example: '175 Tay son', description: 'Address of the customer', required: false })
  @Expose()
  address?: string;
  @ApiProperty({ example: '2023-07-14T17:00:00.000Z', description: 'Creation date of the customer' })
  created_at: Date;
  @ApiProperty({ example: '2023-07-14T17:00:00.000Z', description: 'Update date of the customer' })
  updated_at: Date;
}

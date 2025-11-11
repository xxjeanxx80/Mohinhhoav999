import { PartialType } from '@nestjs/swagger';
import { CreateSpaDto } from './create-spa.dto';

export class UpdateSpaDto extends PartialType(CreateSpaDto) {}

import { Controller } from '@nestjs/common';
import { TonService } from './ton.service';

@Controller()
export class TonController {
  constructor(private readonly tonService: TonService) {}
}

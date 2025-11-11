import { Controller, Get } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiOperation, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { ApiResponseDto } from './common/dto/api-response.dto';
import { AppService } from './app.service';

@ApiTags('core')
@ApiExtraModels(ApiResponseDto)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/hello')
  @ApiOperation({ summary: 'Simple hello endpoint to verify the API is running.' })
  @ApiOkResponse({ type: ApiResponseDto, description: 'Returns a hello message wrapped in the standard response format.' })
  getHello(): ApiResponseDto<string> {
    return new ApiResponseDto({
      success: true,
      message: 'Hello endpoint hit successfully.',
      data: this.appService.getHello(),
    });
  }

  @Get('/health')
  @ApiOperation({ summary: 'Health check endpoint for uptime monitoring.' })
  @ApiOkResponse({
    description: 'Returns the current health information for the service.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'ok' },
                timestamp: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      ],
    },
  })
  getHealth(): ApiResponseDto<{ status: string; timestamp: string }> {
    return new ApiResponseDto({
      success: true,
      message: 'Service is healthy.',
      data: this.appService.getHealth(),
    });
  }
}

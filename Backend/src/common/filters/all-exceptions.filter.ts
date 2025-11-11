import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponseDto } from '../dto/api-response.dto';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred.';
    let details: Record<string, unknown> | undefined = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseMessage = exception.getResponse();

      if (typeof responseMessage === 'string') {
        message = responseMessage;
      } else if (responseMessage && typeof responseMessage === 'object') {
        const responseObj = responseMessage as Record<string, unknown>;
        const { message: nestedMessage, ...rest } = responseObj;
        message = Array.isArray(nestedMessage) 
          ? nestedMessage.join(', ') 
          : (typeof nestedMessage === 'string' ? nestedMessage : message) ?? message;
        details = Object.keys(rest).length > 0 ? rest : undefined;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      details = { name: exception.name, stack: exception.stack };
    }

    this.logger.error(`HTTP ${status} on ${request.method} ${request.url}`, exception instanceof Error ? exception.stack : undefined);

    const payload = new ApiResponseDto({
      success: false,
      message,
      data: details,
    });

    response.status(status).json(payload);
  }
}

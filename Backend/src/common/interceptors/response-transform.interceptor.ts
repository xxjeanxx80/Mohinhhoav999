import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponseDto } from '../dto/api-response.dto';

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<T, ApiResponseDto<T>> {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<ApiResponseDto<T>> {
    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object' && 'success' in data && 'message' in data) {
          return data as ApiResponseDto<T>;
        }

        return new ApiResponseDto<T>({
          success: true,
          message: 'Request processed successfully.',
          data: data as T,
        });
      }),
    );
  }
}

import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { PublishJobInput, PublishJobResult } from '../proto/interfaces';
import { MqService } from '../libs/mq/mq.service';

@Controller()
export class WorkersController {
  constructor(private mq: MqService) {}

  private inferJobType(input: PublishJobInput) {
    const keys = Object.keys(input);
    const payloadKey = keys.find((key) => key.indexOf('JobPayload') > -1);
    const jobType = payloadKey.replace('JobPayload', '');
    if (jobType?.length > 0) {
      return jobType;
    }
    throw new Error(`no valid payload key in any of ${keys.join(',')}`);
  }

  @GrpcMethod('WorkersService', 'PublishJob')
  async publishJob(
    @Payload() input: PublishJobInput,
  ): Promise<PublishJobResult> {
    const jobType = this.inferJobType(input);
    const payload = input[`${jobType}JobPayload`];
    if (!payload) {
      throw new Error(`no payload for type ${jobType}`);
    }
    const jobId = await this.mq.publish({ queue: jobType, message: payload });
    return { jobId };
  }
}

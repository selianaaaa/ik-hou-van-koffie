import { ExecutionContext, createParamDecorator } from "@nestjs/common"

export const Protocol = createParamDecorator(
  (defaultValue: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    console.log("defaultValue", defaultValue)

    return request.protocol
  }
)

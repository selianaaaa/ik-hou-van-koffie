import { ApiProperty } from "@nestjs/swagger"
import { IsString } from "class-validator"

export class CreateCoffeeDto {
  @ApiProperty({ description: "The name of a coffee" })
  @IsString()
  readonly name: string

  @IsString()
  readonly brand: string

  @IsString({ each: true })
  readonly flavors: string[]
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from "@nestjs/common"
import { CoffeesService } from "./coffees.service"
import { CreateCoffeeDto } from "./dto/create-coffee.dto/create-coffee.dto"
import { UpdateCoffeeDto } from "./dto/update-coffee.dto/update-coffee.dto"
import { PaginationQueryDto } from "src/common/dto/pagination-query.dto/pagination-query.dto"
import { Public } from "src/common/decorators/public.decorators"
import { ParseIntPipe } from "src/common/pipes/parse-int/parse-int.pipe"
import { Protocol } from "src/common/decorators/protocol.decorator"

@Controller("coffees")
export class CoffeesController {
  constructor(private readonly coffeesService: CoffeesService) {}

  @Public()
  @Get()
  async findAll(
    @Protocol("https") protocol: string,
    @Query() paginationQuery: PaginationQueryDto
  ) {
    console.log("protocol", protocol)
    return this.coffeesService.findAll(paginationQuery)
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.coffeesService.findOne("" + id)
  }

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  create(@Body() createCoffeeDto: CreateCoffeeDto) {
    return this.coffeesService.create(createCoffeeDto)
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body(ValidationPipe) updateCoffeeDto: UpdateCoffeeDto
  ) {
    return this.coffeesService.update(id, updateCoffeeDto)
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.coffeesService.remove(id)
  }
}

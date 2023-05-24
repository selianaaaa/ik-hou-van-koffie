import { Injectable, NotFoundException } from "@nestjs/common"
import { Coffee } from "./entities/coffee.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { CreateCoffeeDto } from "./dto/create-coffee.dto/create-coffee.dto"

@Injectable()
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private coffeeRepository: Repository<Coffee>
  ) {}

  findAll() {
    return this.coffeeRepository.find()
  }

  async findOne(id: string) {
    const coffee = await this.coffeeRepository.findOneBy({ id: +id })

    if (!coffee) {
      throw new NotFoundException(`Coffee ${id} not found`)
    }

    return coffee
  }

  create(createCoffeeDto: CreateCoffeeDto) {
    const coffee = this.coffeeRepository.create(createCoffeeDto)

    return this.coffeeRepository.save(coffee)
  }

  async update(id: string, updateCoffeeDto: any) {
    const coffee = await this.coffeeRepository.preload({
      id: +id,
      ...updateCoffeeDto,
    })

    if (!coffee) {
      throw new NotFoundException(`Coffee ${id} not found`)
    }

    return this.coffeeRepository.save(coffee)
  }

  async remove(id: string) {
    const coffee = await this.coffeeRepository.findOneBy({ id: +id })

    return this.coffeeRepository.remove(coffee)
  }
}

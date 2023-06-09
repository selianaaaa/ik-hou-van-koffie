import { Inject, Injectable, NotFoundException } from "@nestjs/common"
import { Coffee } from "./entities/coffee.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, Connection } from "typeorm"
import { CreateCoffeeDto } from "./dto/create-coffee.dto/create-coffee.dto"
import { Flavor } from "./entities/flavor.entity"
import { UpdateCoffeeDto } from "./dto/update-coffee.dto/update-coffee.dto"
import { PaginationQueryDto } from "src/common/dto/pagination-query.dto/pagination-query.dto"
import { Event } from "src/events/entities/event.entity/event.entity"
import { ConfigService, ConfigType } from "@nestjs/config"
import coffeesConfig from "./config/coffees.config"

@Injectable()
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private coffeeRepository: Repository<Coffee>,
    @InjectRepository(Flavor)
    private flavorRepository: Repository<Flavor>,
    private readonly connection: Connection,
    private readonly configService: ConfigService,
    @Inject(coffeesConfig.KEY)
    private readonly coffeesConfiguration: ConfigType<typeof coffeesConfig>
  ) {
    console.log(coffeesConfiguration)
  }

  findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery

    return this.coffeeRepository.find({
      relations: ["flavors"],
      skip: offset,
      take: limit,
    })
  }

  async findOne(id: string) {
    const coffee = await this.coffeeRepository.findOne({
      where: { id: +id },
      relations: ["flavors"],
    })

    if (!coffee) {
      throw new NotFoundException(`Coffee ${id} not found`)
    }

    return coffee
  }

  async create(createCoffeeDto: CreateCoffeeDto) {
    const flavors = await Promise.all(
      createCoffeeDto.flavors.map((name) => this.preloadFlavorByName(name))
    )

    const coffee = this.coffeeRepository.create({ ...createCoffeeDto, flavors })

    return this.coffeeRepository.save(coffee)
  }

  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    const flavors =
      updateCoffeeDto.flavors &&
      (await Promise.all(
        updateCoffeeDto.flavors.map((name) => this.preloadFlavorByName(name))
      ))

    const coffee = await this.coffeeRepository.preload({
      id: +id,
      ...updateCoffeeDto,
      flavors,
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

  private async preloadFlavorByName(name: string) {
    const existingFlavor = await this.flavorRepository.findOne({
      where: { name },
    })

    if (existingFlavor) {
      return existingFlavor
    }

    return this.flavorRepository.create({ name })
  }

  async recommendCoffee(coffee: Coffee) {
    const queryRunner = this.connection.createQueryRunner()

    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      coffee.recommendations++

      const recommendEvent = new Event()
      recommendEvent.name = "recommend_coffee"
      recommendEvent.type = "coffee"
      recommendEvent.payload = { coffeeId: coffee.id }

      await queryRunner.manager.save(coffee)
      await queryRunner.manager.save(recommendEvent)

      await queryRunner.commitTransaction()
    } catch (err) {
      await queryRunner.rollbackTransaction()
    } finally {
      await queryRunner.release()
    }
  }
}

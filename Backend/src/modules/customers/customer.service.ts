import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Customer } from "./entities/customer.entity";
import { Repository } from "typeorm";

@Injectable()
export class CustomerService {

    constructor(
        @InjectRepository(Customer)
        private  customerRepository: Repository<Customer>,
    ) {}    
    
    public async findAll(): Promise<Customer[]> {
        return this.customerRepository.find();
    }

    async findOne(id: number): Promise<Customer | null> {
        return this.customerRepository.findOne({ where: { id } });
    }

    async create(customer: Customer): Promise<Customer> {
        return this.customerRepository.save(customer);
    }

    async update(id: number, customer: Customer): Promise<Customer | null> {
        await this.customerRepository.update(id, customer);
        return this.customerRepository.findOne({ where: { id } });
    }

    async remove(id: number): Promise<void> {
        await this.customerRepository.delete(id);
    }
}

import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { generateRandomStr } from './utils';
import { UniqueCode } from './entities/UniqueCode';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class UniqueCodeService {
  @InjectEntityManager()
  private entityManager: EntityManager;

  @Cron(CronExpression.EVERY_5_SECONDS)
  async generateCode() {
    const str = generateRandomStr(6);
    const uniqueCode = await this.entityManager.findOne(UniqueCode, {
      where: { code: str },
    });
    if (!uniqueCode) {
      const newCode = new UniqueCode();
      newCode.code = str;
      newCode.status = 0;
      return await this.entityManager.insert(UniqueCode, newCode);
    } else {
      return this.generateCode();
    }
  }
  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async batchGenerateCode() {
    for (let i = 0; i < 10000; i++) {
      this.generateCode();
    }
  }
}

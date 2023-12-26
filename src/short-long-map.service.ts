import { Inject, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { UniqueCodeService } from './unique-code.service';
import { UniqueCode } from './entities/UniqueCode';
import { ShortLongMap } from './entities/ShortLongMap';

@Injectable()
export class ShortLongMapService {
  @InjectEntityManager()
  private entityManager: EntityManager;

  @Inject(UniqueCodeService)
  private uniqueCodeService: UniqueCodeService;

  async getLongUrl(code: string) {
    const map= await this.entityManager.findOneBy(ShortLongMap, {
        shortUrl: code,
    }) 
    if (!map) {
      return null
    }
    return map.longUrl
  }

  async generate(longUrl: string) {
    let uniqueCode = await this.entityManager.findOneBy(UniqueCode, {
      status: 0,
    });
    if(!uniqueCode){
      uniqueCode = await this.uniqueCodeService.generateCode();
    }
    const shortUrl = uniqueCode.code;
    const shortLongMap = new ShortLongMap();
    shortLongMap.shortUrl = shortUrl;
    shortLongMap.longUrl = longUrl;
    await this.entityManager.insert(ShortLongMap, shortLongMap);
    await this.entityManager.update(UniqueCode, uniqueCode, {
      status: 1,
    })
    return uniqueCode.code;

  }
}

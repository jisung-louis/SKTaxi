import type {
  DeleteAccountParams,
  IMinecraftRepository,
  RegisterAccountParams,
  RegisterAccountResult,
} from './IMinecraftRepository';
import {minecraftApiClient, type MinecraftApiClient} from '../api/minecraftApiClient';
import {
  mapMinecraftAccountDtoToEntry,
  mapMinecraftAccountDtoToRegisterResult,
  mapRegisterParamsToCreateRequestDto,
} from '../mappers/minecraftApiMappers';
import type {MinecraftAccountEntry} from '../../model/types';

export class SpringMinecraftRepository implements IMinecraftRepository {
  constructor(
    private readonly apiClient: MinecraftApiClient = minecraftApiClient,
  ) {}

  async getUserMinecraftAccounts(_uid: string): Promise<MinecraftAccountEntry[]> {
    const response = await this.apiClient.getMyAccounts();
    return response.data.map(mapMinecraftAccountDtoToEntry);
  }

  async registerAccount(
    params: RegisterAccountParams,
  ): Promise<RegisterAccountResult> {
    const response = await this.apiClient.createMyAccount(
      mapRegisterParamsToCreateRequestDto(params),
    );
    return mapMinecraftAccountDtoToRegisterResult(response.data);
  }

  async deleteAccount(
    params: DeleteAccountParams,
  ): Promise<RegisterAccountResult> {
    const response = await this.apiClient.deleteMyAccount(params.accountId);
    return mapMinecraftAccountDtoToRegisterResult(response.data);
  }
}

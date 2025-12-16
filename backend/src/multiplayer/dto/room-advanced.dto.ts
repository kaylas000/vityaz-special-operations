import { IsString, IsNumber, IsOptional, IsArray, IsEnum, IsBoolean } from 'class-validator';

export enum RoomGameMode {
  DEATHMATCH = 'deathmatch',
  TEAM_DEATHMATCH = 'team_deathmatch',
  CAPTURE_FLAG = 'capture_flag',
  KING_OF_HILL = 'king_of_hill',
  ELIMINATION = 'elimination',
  DOMINATION = 'domination',
}

export enum RoomDifficulty {
  EASY = 'easy',
  NORMAL = 'normal',
  HARD = 'hard',
  INSANE = 'insane',
}

export class CreateRoomDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(RoomGameMode)
  gameMode: RoomGameMode;

  @IsNumber()
  maxPlayers: number;

  @IsNumber()
  @IsOptional()
  roundTime?: number; // in seconds

  @IsNumber()
  @IsOptional()
  maxRounds?: number;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @IsString()
  @IsOptional()
  password?: string;

  @IsEnum(RoomDifficulty)
  @IsOptional()
  difficulty?: RoomDifficulty;

  @IsBoolean()
  @IsOptional()
  friendlyFire?: boolean;

  @IsBoolean()
  @IsOptional()
  voiceChat?: boolean;
}

export class RoomSettingsDto {
  @IsEnum(RoomGameMode)
  @IsOptional()
  gameMode?: RoomGameMode;

  @IsNumber()
  @IsOptional()
  roundTime?: number;

  @IsNumber()
  @IsOptional()
  maxRounds?: number;

  @IsBoolean()
  @IsOptional()
  friendlyFire?: boolean;

  @IsBoolean()
  @IsOptional()
  voiceChat?: boolean;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @IsString()
  @IsOptional()
  password?: string;
}

export class PlayerJoinRoomDto {
  @IsString()
  roomId: string;

  @IsString()
  playerId: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  nickname?: string;
}

export class RoomStateDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsEnum(RoomGameMode)
  gameMode: RoomGameMode;

  @IsNumber()
  playerCount: number;

  @IsNumber()
  maxPlayers: number;

  @IsArray()
  players: PlayerInRoomDto[];

  @IsBoolean()
  isGameRunning: boolean;

  @IsNumber()
  @IsOptional()
  currentRound?: number;

  @IsNumber()
  @IsOptional()
  roundTimeRemaining?: number;

  @IsArray()
  @IsOptional()
  scores?: Map<string, number>;
}

export class PlayerInRoomDto {
  @IsString()
  id: string;

  @IsString()
  nickname: string;

  @IsNumber()
  score: number;

  @IsNumber()
  kills: number;

  @IsNumber()
  deaths: number;

  @IsBoolean()
  isReady: boolean;

  @IsNumber()
  ping: number;

  @IsBoolean()
  @IsOptional()
  isLeader?: boolean;
}

export class RoomEventDto {
  @IsEnum(RoomEventType)
  eventType: RoomEventType;

  @IsString()
  roomId: string;

  @IsString()
  @IsOptional()
  playerId?: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsNumber()
  timestamp: number;
}

export enum RoomEventType {
  PLAYER_JOINED = 'player_joined',
  PLAYER_LEFT = 'player_left',
  GAME_STARTED = 'game_started',
  GAME_ENDED = 'game_ended',
  ROUND_STARTED = 'round_started',
  ROUND_ENDED = 'round_ended',
  PLAYER_KILLED = 'player_killed',
  FLAG_CAPTURED = 'flag_captured',
  HILL_CAPTURED = 'hill_captured',
  ROOM_CLOSED = 'room_closed',
}

export class MatchmakingQueueDto {
  @IsString()
  playerId: string;

  @IsEnum(RoomGameMode)
  @IsOptional()
  preferredGameMode?: RoomGameMode;

  @IsNumber()
  @IsOptional()
  estimatedSkillLevel?: number; // ELO rating

  @IsNumber()
  @IsOptional()
  maxWaitTime?: number; // in seconds
}

export class MatchFoundDto {
  @IsString()
  roomId: string;

  @IsString()
  roomName: string;

  @IsEnum(RoomGameMode)
  gameMode: RoomGameMode;

  @IsNumber()
  estimatedWaitTime: number; // in milliseconds
}

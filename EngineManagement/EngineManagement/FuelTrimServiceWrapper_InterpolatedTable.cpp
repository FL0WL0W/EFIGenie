#include "Services.h"
#include "FuelTrimServiceWrapper_InterpolatedTable.h"

#ifdef FuelTrimServiceWrapper_InterpolatedTableExists
namespace EngineManagement
{
	FuelTrimServiceWrapper_InterpolatedTable::FuelTrimServiceWrapper_InterpolatedTable(void *config)
	{
		//TODO: CONFIG
	}

	short FuelTrimServiceWrapper_InterpolatedTable::GetFuelTrim(unsigned char cylinder)
	{	
		short fuelTrim;
		
		for (int i = 0; i < _fuelTrimChannels; i++)
		{
			if (_fuelTrimChannelAssignmentMask[i] & (1 << cylinder))
			{
				//a little bit crude just selecting max magnitude. should find a better algo for this. example is narrowbands + widebands
				short channelTrim = _fuelTrimChannel[i];
				if ((fuelTrim < 0 && channelTrim < 0 && channelTrim < fuelTrim) || (fuelTrim > 0 && channelTrim > 0 && channelTrim > fuelTrim) ||
					(fuelTrim < 0 && channelTrim > 0 && channelTrim > -fuelTrim) || (fuelTrim > 0 && channelTrim < 0 && -channelTrim > fuelTrim))
					fuelTrim = _fuelTrimChannel[i];
			}
		}
		
		return fuelTrim;
	}

	void FuelTrimServiceWrapper_InterpolatedTable::TrimTick()
	{
		unsigned int ticksPerSecond = CurrentTimerService->GetTicksPerSecond();
		unsigned int origTick = CurrentTimerService->GetTick();
		unsigned int tick = origTick;
		unsigned int prevTick = _prevTick;
		if (tick < prevTick)
		{
			prevTick += 2147483647;
			tick += 2147483647;
		}
		float rpm = CurrentDecoder->GetRpm();
		if (tick < (prevTick + ticksPerSecond / _dotRpmSampleRate))
		{
			_rpmDot = ((rpm - _prevRpm) / (tick - prevTick)) * ticksPerSecond;
			_prevRpm = rpm;
			_prevTick = origTick;
		}
		float delayTime = (60 * _cycleDelay) / rpm;

		float y = 0;
		float yPredict = 0;
#ifdef ITpsServiceExists
#ifdef IMapServiceExists
		if (_useTps)
		{
#endif
			y = CurrentThrottlePositionService->Tps;
			yPredict = CurrentThrottlePositionService->Tps - delayTime * CurrentThrottlePositionService->TpsDot;
#ifdef IMapServiceExists
		}
		else
		{
#endif
#endif
#ifdef IMapServiceExists
			y = CurrentMapService->MapBar;
			yPredict = CurrentMapService->MapBar - delayTime * CurrentMapService->MapBarDot;
#ifdef ITpsServiceExists
		}
#endif
#endif
		unsigned short rpmPredict = rpm - delayTime * _rpmDot;

		unsigned char yPredictIndexL = 0;
		unsigned char yPredictIndexH = 0;
		float yDist = 0;
		for (int i = _yResolution - 1; i >= 0; i--)
		{
			if (yPredict > _yDivisions[i])
			{
				if (i == _yResolution - 1)
				{
					yDist = yPredict - _yDivisions[i];
					if (yDist > _yInterpolationDistance)
					{
						yPredictIndexH = i;
						yPredictIndexL = i;
					}
					else
					{
						yPredictIndexH = i;
						yPredictIndexL = yPredictIndexH - 1;
					}
				}
				else
				{
					if (yPredict - _yDivisions[i] < _yDivisions[i + 1] - yPredict)
					{
						yDist = yPredict - _yDivisions[i];
						if (yDist > _yInterpolationDistance)
						{
							yPredictIndexH = i;
							yPredictIndexL = i;
						}
						else
						{
							yPredictIndexH = i;
							yPredictIndexL = yPredictIndexH - 1;
						}
					}
					else
					{
						yDist = _yDivisions[i + 1] - yPredict;
						if (yDist > _yInterpolationDistance)
						{
							yPredictIndexH = i;
							yPredictIndexL = i;
						}
						else
						{
							yPredictIndexL = i;
							yPredictIndexH = i + 1;
						}
					}
				}
			}
			else if (i == 0)
			{
				yDist = _yDivisions[0] - yPredict;
				if (yDist > _yInterpolationDistance)
				{
					yPredictIndexH = 0;
					yPredictIndexL = 0;
				}
				else
				{
					yPredictIndexL = 0;
					yPredictIndexH = 1;
				}
			}
		}
		float yPredictMultiplier = yDist / _yInterpolationDistance;

		unsigned char rpmPredictIndexL = 0;
		unsigned char rpmPredictIndexH = 0;
		unsigned short rpmDist = 0;
		for (int i = _rpmResolution - 1; i >= 0; i--)
		{
			if (rpmPredict > _rpmDivisions[i])
			{
				if (i == _rpmResolution - 1)
				{
					rpmDist = rpmPredict - _rpmDivisions[i];
					if (rpmDist > _rpmInterpolationDistance)
					{
						rpmPredictIndexH = i;
						rpmPredictIndexL = i;
					}
					else
					{
						rpmPredictIndexH = i;
						rpmPredictIndexL = rpmPredictIndexH - 1;
					}
				}
				else
				{
					if (rpmPredict - _rpmDivisions[i] < _rpmDivisions[i + 1] - rpmPredict)
					{
						rpmDist = rpmPredict - _rpmDivisions[i];
						if (rpmDist > _rpmInterpolationDistance)
						{
							rpmPredictIndexH = i;
							rpmPredictIndexL = i;
						}
						else
						{
							rpmPredictIndexH = i;
							rpmPredictIndexL = rpmPredictIndexH - 1;
						}
					}
					else
					{
						rpmDist = _rpmDivisions[i + 1] - rpmPredict;
						if (rpmDist > _rpmInterpolationDistance)
						{
							rpmPredictIndexH = i;
							rpmPredictIndexL = i;
						}
						else
						{
							rpmPredictIndexL = i;
							rpmPredictIndexH = i + 1;
						}
					}
				}
			}
			else if (i == 0)
			{
				rpmDist = _rpmDivisions[0] - rpmPredict;
				if (rpmDist > _rpmInterpolationDistance)
				{
					rpmPredictIndexH = 0;
					rpmPredictIndexL = 0;
				}
				else
				{
					rpmPredictIndexL = 0;
					rpmPredictIndexH = 1;
				}
			}
		}
		float rpmPredictMultiplier = rpmDist / _rpmInterpolationDistance;
			
		unsigned char yIndexL = 0;
		unsigned char yIndexH = 0;
		yDist = 0;
		for (int i = _yResolution - 1; i >= 0; i--)
		{
			if (y > _yDivisions[i])
			{
				if (i == _yResolution - 1)
				{
					yDist = y - _yDivisions[i];
					if (yDist > _yInterpolationDistance)
					{
						yIndexH = i;
						yIndexL = i;
					}
					else
					{
						yIndexH = i;
						yIndexL = yIndexH - 1;
					}
				}
				else
				{
					if (y - _yDivisions[i] < _yDivisions[i + 1] - y)
					{
						yDist = y - _yDivisions[i];
						if (yDist > _yInterpolationDistance)
						{
							yIndexH = i;
							yIndexL = i;
						}
						else
						{
							yIndexH = i;
							yIndexL = yIndexH - 1;
						}
					}
					else
					{
						yDist = _yDivisions[i + 1] - y;
						if (yDist > _yInterpolationDistance)
						{
							yIndexH = i;
							yIndexL = i;
						}
						else
						{
							yIndexL = i;
							yIndexH = i + 1;
						}
					}
				}
			}
			else if (i == 0)
			{
				yDist = _yDivisions[0] - y;
				if (yDist > _yInterpolationDistance)
				{
					yIndexH = 0;
					yIndexL = 0;
				}
				else
				{
					yIndexL = 0;
					yIndexH = 1;
				}
			}
		}
		unsigned char yMultiplier = yDist / _yInterpolationDistance;

		unsigned char rpmIndexL = 0;
		unsigned char rpmIndexH = 0;
		rpmDist = 0;
		for (int i = _rpmResolution - 1; i >= 0; i--)
		{
			if (rpm > _rpmDivisions[i])
			{
				if (i == _rpmResolution - 1)
				{
					rpmDist = rpm - _rpmDivisions[i];
					if (rpmDist > _rpmInterpolationDistance)
					{
						rpmIndexH = i;
						rpmIndexL = i;
					}
					else
					{
						rpmIndexH = i;
						rpmIndexL = rpmIndexH - 1;
					}
				}
				else
				{
					if (rpm - _rpmDivisions[i] < _rpmDivisions[i + 1] - rpm)
					{
						rpmDist = rpm - _rpmDivisions[i];
						if (rpmDist > _rpmInterpolationDistance)
						{
							rpmIndexH = i;
							rpmIndexL = i;
						}
						else
						{
							rpmIndexH = i;
							rpmIndexL = rpmIndexH - 1;
						}
					}
					else
					{
						rpmDist = _rpmDivisions[i + 1] - rpm;
						if (rpmDist > _rpmInterpolationDistance)
						{
							rpmIndexH = i;
							rpmIndexL = i;
						}
						else
						{
							rpmIndexL = i;
							rpmIndexH = i + 1;
						}
					}
				}
			}
			else if (i == 0)
			{
				rpmDist = _rpmDivisions[0] - rpm;
				if (rpmDist > _rpmInterpolationDistance)
				{
					rpmIndexH = 0;
					rpmIndexL = 0;
				}
				else
				{
					rpmIndexL = 0;
					rpmIndexH = 1;
				}
			}
		}
		unsigned char rpmMultiplier = rpmDist / _rpmInterpolationDistance;

		for (int i = 0; i < _fuelTrimChannels; i++)
		{			
			_fuelTrimService[i]->TrimTick();
#if MAX_CYLINDERS <= 8
			int fuelTrim = 0;
#elif MAX_CYLINDERS <= 16
			long fuelTrim = 0;
#endif
			unsigned char cylindersAdded = 0;
			for (unsigned char cylinder = 0; cylinder < MAX_CYLINDERS; cylinder++)
			{
				if (_fuelTrimChannelAssignmentMask[i] & (1 << cylinder))
				{
					short cylinderTrim = _fuelTrimService[i]->GetFuelTrim(cylinder);
					if (cylinderTrim != 0)
					{
						fuelTrim += cylinderTrim;
						cylindersAdded++;
					}
				}
			}
			fuelTrim /= cylindersAdded;
				
			_fuelTrimTable[i * _yResolution * _rpmResolution + yPredictIndexL * _rpmResolution + rpmPredictIndexL] += fuelTrim * (1 - yPredictMultiplier) * (1 - rpmPredictMultiplier);
			_fuelTrimTable[i * _yResolution * _rpmResolution + yPredictIndexL * _rpmResolution + rpmPredictIndexH] += fuelTrim * (1 - yPredictMultiplier) * rpmPredictMultiplier;
			_fuelTrimTable[i * _yResolution * _rpmResolution + yPredictIndexH * _rpmResolution + rpmPredictIndexL] += fuelTrim * yPredictMultiplier * (1 - rpmPredictMultiplier);
			_fuelTrimTable[i * _yResolution * _rpmResolution + yPredictIndexH * _rpmResolution + rpmPredictIndexH] += fuelTrim * yPredictMultiplier * rpmPredictMultiplier;

			_fuelTrimChannel[i] = _fuelTrimTable[i * _yResolution * _rpmResolution + yIndexL * _rpmResolution + rpmIndexL] * (1 - yMultiplier) * (1 - rpmMultiplier)
								+ _fuelTrimTable[i * _yResolution * _rpmResolution + yIndexL * _rpmResolution + rpmIndexH] * (1 - yMultiplier) * rpmMultiplier
								+ _fuelTrimTable[i * _yResolution * _rpmResolution + yIndexH * _rpmResolution + rpmIndexL] * yMultiplier * (1 - rpmMultiplier)
								+ _fuelTrimTable[i * _yResolution * _rpmResolution + yIndexH * _rpmResolution + rpmIndexH] * yMultiplier * rpmMultiplier;
		}
	}
}
#endif
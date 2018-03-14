#include "Services.h"
#include "FuelTrimService_InterpolatedTable.h"

#ifdef FuelTrimService_InterpolatedTableExists
namespace EngineManagement
{
	FuelTrimService_InterpolatedTable::FuelTrimService_InterpolatedTable(void *config)
	{
		if (CurrentManifoldAirPressureService == 0)
			return; //TODO: figure out error handling
		//lambda service stuff
		//TODO: CONFIG
	}

	short FuelTrimService_InterpolatedTable::GetFuelTrim(unsigned char cylinder)
	{	
		return _fuelTrim;
	}

	void FuelTrimService_InterpolatedTable::TrimTick()
	{
		if (CurrentAfrService->Lambda < 1 + _lambdaDeltaEnable || CurrentAfrService->Lambda > 1 - _lambdaDeltaEnable)
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
			float elapsedTime = (tick - prevTick) / ticksPerSecond;
			if (elapsedTime * _updateRate < 1)
				return;
			float rpm = CurrentDecoder->GetRpm();
			_rpmDot = (rpm - _prevRpm) / elapsedTime;
			_prevRpm = rpm;
			_prevTick = origTick;
			float delayTime = (60 * _cycleDelay) / rpm;

			float y = 0;
			float yPredict = 0;
			if (_useTps && CurrentThrottlePositionService != 0)
			{
				y = CurrentThrottlePositionService->Value;
				yPredict = y - delayTime * CurrentThrottlePositionService->Value;
			}
			else if(CurrentManifoldAirPressureService != 0)
			{
				y = CurrentManifoldAirPressureService->Value;
				yPredict = y - delayTime * CurrentManifoldAirPressureService->ValueDot;
			}
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
		
			_lambdaSensorService->ReadValue();
			
			float error = CurrentAfrService->Lambda - _lambdaSensorService->Value;
			float fuelTrimIntegral;
		
			if (_isPid)
			{
				fuelTrimIntegral = error * elapsedTime;
			}
			else
			{
				if (error != 0)
				{
					fuelTrimIntegral = _kI * (tick - prevTick) / ticksPerSecond;
					if(error < 0)
						fuelTrimIntegral = -fuelTrimIntegral;
				}
			}
				
			_fuelTrimIntegralTable[yPredictIndexL * _rpmResolution + rpmPredictIndexL] += fuelTrimIntegral * 128 * (1 - yPredictMultiplier) * (1 - rpmPredictMultiplier);
			_fuelTrimIntegralTable[yPredictIndexL * _rpmResolution + rpmPredictIndexH] += fuelTrimIntegral * 128 * (1 - yPredictMultiplier) * rpmPredictMultiplier;
			_fuelTrimIntegralTable[yPredictIndexH * _rpmResolution + rpmPredictIndexL] += fuelTrimIntegral * 128 * yPredictMultiplier * (1 - rpmPredictMultiplier);
			_fuelTrimIntegralTable[yPredictIndexH * _rpmResolution + rpmPredictIndexH] += fuelTrimIntegral * 128 * yPredictMultiplier * rpmPredictMultiplier;

			fuelTrimIntegral = (_fuelTrimIntegralTable[yIndexL * _rpmResolution + rpmIndexL] * (1 - yMultiplier) * (1 - rpmMultiplier)
					  + _fuelTrimIntegralTable[yIndexL * _rpmResolution + rpmIndexH] * (1 - yMultiplier) * rpmMultiplier
					  + _fuelTrimIntegralTable[yIndexH * _rpmResolution + rpmIndexL] * yMultiplier * (1 - rpmMultiplier)
					  + _fuelTrimIntegralTable[yIndexH * _rpmResolution + rpmIndexH] * yMultiplier * rpmMultiplier);
		
			_fuelTrim = fuelTrimIntegral;
			if (_isPid)
			{
				fuelTrimIntegral *= 0.0078125;
				
				float derivative = (error - _lastError) / elapsedTime;
				
				_lastError = error;
				
				_fuelTrim = _kP * error + _kI * fuelTrimIntegral + _kD * derivative;
			}
		}
		else
		{
			_fuelTrim = 0;
		}
	}
}
#endif
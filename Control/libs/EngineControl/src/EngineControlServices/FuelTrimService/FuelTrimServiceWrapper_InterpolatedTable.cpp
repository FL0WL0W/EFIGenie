#include "stdlib.h"
#include "EngineControlServices/FuelTrimService/FuelTrimService_InterpolatedTable.h"

#ifdef FUELTRIMSERVICE_INTERPOLATEDTABLE_H
namespace EngineControlServices
{
	FuelTrimService_InterpolatedTable::FuelTrimService_InterpolatedTable(
		const FuelTrimService_InterpolatedTableConfig *config, 
		ITimerService *timerService, 
		IReluctor *reluctor,
		IFloatInputService *throttlePositionService, 
		IFloatInputService *manifoldAbsolutePressureService, 
		IFloatInputService *lambdaSensorService,
		IAfrService *afrService)
	{				
		_config = config;
		_timerService = timerService;
		_reluctor = reluctor;
		_throttlePositionService = throttlePositionService;
		_manifoldAbsolutePressureService = manifoldAbsolutePressureService;
		_lambdaSensorService = lambdaSensorService;
		_afrService = afrService;
				
		_fuelTrimIntegralTable = (short *)malloc(sizeof(short) * (_config->RpmResolution+1) * (_config->YResolution+1));
	}

	short FuelTrimService_InterpolatedTable::GetFuelTrim(unsigned char cylinder)
	{	
		return _fuelTrim;
	}

	void FuelTrimService_InterpolatedTable::Tick()
	{
		if (_afrService->Lambda < 1 + _config->LambdaDeltaEnable || _afrService->Lambda > 1 - _config->LambdaDeltaEnable)
		{
			float elapsedTime = _timerService->GetElapsedTime(_prevTick);
			if (elapsedTime * _config->UpdateRate < 1)
				return;
			_prevTick = _timerService->GetTick();
			unsigned short rpm = _reluctor->GetRpm();
			_rpmDot = (unsigned int)round((rpm - _prevRpm) / elapsedTime);
			_prevRpm = rpm;
			float delayTime = (60 * _config->CycleDelay) / (float)rpm;

			float y = 0;
			float yPredict = 0;
			if (_config->UseTps && _throttlePositionService != 0)
			{
				y = _throttlePositionService->Value;
				yPredict = y - delayTime * _throttlePositionService->Value;
			}
			else if(_manifoldAbsolutePressureService != 0)
			{
				y = _manifoldAbsolutePressureService->Value;
				yPredict = y - delayTime * _manifoldAbsolutePressureService->ValueDot;
			}
			unsigned short rpmPredict = rpm - (unsigned short)(delayTime * _rpmDot);

			unsigned char yPredictIndexL = 0;
			unsigned char yPredictIndexH = 0;
			const float *yDivisions = _config->YDivisions();
			float yDist = 0;
			for (int i = _config->YResolution; i >= 0; i--)
			{
				if (i == 0)
				{
					yDist = yDivisions[0] - yPredict;
					if (yDist > _config->YInterpolationDistance)
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
				else if (yPredict > yDivisions[i - 1])
				{
					if (i == _config->YResolution)
					{
						yDist = yPredict - yDivisions[i - 1];
						if (yDist > _config->YInterpolationDistance)
						{
							yPredictIndexH = i;
							yPredictIndexL = i;
						}
						else
						{
							yPredictIndexH = i;
							yPredictIndexL = i - 1;
						}
					}
					else
					{
						if ((yDist = yPredict - yDivisions[i - 1]) < yDivisions[i] - yPredict)
						{
							if (yDist > _config->YInterpolationDistance)
							{
								yPredictIndexH = i;
								yPredictIndexL = i;
							}
							else
							{
								yPredictIndexH = i;
								yPredictIndexL = i - 1;
							}
						}
						else
						{
							yDist = yDivisions[i] - yPredict;
							if (yDist > _config->YInterpolationDistance)
							{
								yPredictIndexH = i;
								yPredictIndexL = i;
							}
							else
							{
								yPredictIndexH = i + 1;
								yPredictIndexL = i;
							}
						}
					}
				}
			}
			float yPredictMultiplier = yDist / _config->YInterpolationDistance;

			unsigned char rpmPredictIndexL = 0;
			unsigned char rpmPredictIndexH = 0;
			unsigned short rpmDist = 0;
			const unsigned short *rpmDivisions = _config->RpmDivisions();
			for (int i = _config->RpmResolution; i >= 0; i--)
			{
				if (i == 0)
				{
					rpmDist = rpmDivisions[0] - rpmPredict;
					if (rpmDist > _config->RpmInterpolationDistance)
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
				else if (rpmPredict > rpmDivisions[i - 1])
				{
					if (i == _config->RpmResolution)
					{
						rpmDist = rpmPredict - rpmDivisions[i - 1];
						if (rpmDist > _config->RpmInterpolationDistance)
						{
							rpmPredictIndexH = i;
							rpmPredictIndexL = i;
						}
						else
						{
							rpmPredictIndexH = i;
							rpmPredictIndexL = i - 1;
						}
					}
					else
					{
						if ((rpmDist = rpmPredict - rpmDivisions[i - 1]) < rpmDivisions[i] - rpmPredict)
						{
							if (rpmDist > _config->RpmInterpolationDistance)
							{
								rpmPredictIndexH = i;
								rpmPredictIndexL = i;
							}
							else
							{
								rpmPredictIndexH = i;
								rpmPredictIndexL = i - 1;
							}
						}
						else
						{
							rpmDist = rpmDivisions[i] - rpmPredict;
							if (rpmDist > _config->RpmInterpolationDistance)
							{
								rpmPredictIndexH = i;
								rpmPredictIndexL = i;
							}
							else
							{
								rpmPredictIndexH = i + 1;
								rpmPredictIndexL = i;
							}
						}
					}
				}
			}
			float rpmPredictMultiplier = (float)rpmDist / _config->RpmInterpolationDistance;
			
			unsigned char yIndexL = 0;
			unsigned char yIndexH = 0;
			yDist = 0;
			for (int i = _config->YResolution - 1; i >= 0; i--)
			{
				if (y > yDivisions[i])
				{
					if (i == _config->YResolution - 1)
					{
						yDist = y - yDivisions[i];
						if (yDist > _config->YInterpolationDistance)
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
						if (y - yDivisions[i] < yDivisions[i + 1] - y)
						{
							yDist = y - yDivisions[i];
							if (yDist > _config->YInterpolationDistance)
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
							yDist = yDivisions[i + 1] - y;
							if (yDist > _config->YInterpolationDistance)
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
					yDist = yDivisions[0] - y;
					if (yDist > _config->YInterpolationDistance)
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
			float yMultiplier = (float)yDist / _config->YInterpolationDistance;

			unsigned char rpmIndexL = 0;
			unsigned char rpmIndexH = 0;
			rpmDist = 0;
			for (int i = _config->RpmResolution - 1; i >= 0; i--)
			{
				if (rpm > rpmDivisions[i])
				{
					if (i == _config->RpmResolution - 1)
					{
						rpmDist = rpm - rpmDivisions[i];
						if (rpmDist > _config->RpmInterpolationDistance)
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
						if (rpm - rpmDivisions[i] < rpmDivisions[i + 1] - rpm)
						{
							rpmDist = rpm - rpmDivisions[i];
							if (rpmDist > _config->RpmInterpolationDistance)
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
							rpmDist = rpmDivisions[i + 1] - rpm;
							if (rpmDist > _config->RpmInterpolationDistance)
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
					rpmDist = rpmDivisions[0] - rpm;
					if (rpmDist > _config->RpmInterpolationDistance)
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
			unsigned char rpmMultiplier = rpmDist / _config->RpmInterpolationDistance;
		
			_lambdaSensorService->ReadValue();
			
			float error = _afrService->Lambda - _lambdaSensorService->Value;
			float fuelTrimIntegral;
		
			if (_config->IsPid)
			{
				fuelTrimIntegral = error * elapsedTime * _config->I;
			}
			else
			{
				if (error != 0)
				{
					fuelTrimIntegral = _config->I * elapsedTime;
					if(error < 0)
						fuelTrimIntegral = -fuelTrimIntegral;
				}
			}
				
			_fuelTrimIntegralTable[yPredictIndexL * _config->RpmResolution + rpmPredictIndexL] += (short)round(fuelTrimIntegral * 128 * (1 - yPredictMultiplier) * (1 - rpmPredictMultiplier));
			_fuelTrimIntegralTable[yPredictIndexL * _config->RpmResolution + rpmPredictIndexH] += (short)round(fuelTrimIntegral * 128 * (1 - yPredictMultiplier) * rpmPredictMultiplier);
			_fuelTrimIntegralTable[yPredictIndexH * _config->RpmResolution + rpmPredictIndexL] += (short)round(fuelTrimIntegral * 128 * yPredictMultiplier * (1 - rpmPredictMultiplier));
			_fuelTrimIntegralTable[yPredictIndexH * _config->RpmResolution + rpmPredictIndexH] += (short)round(fuelTrimIntegral * 128 * yPredictMultiplier * rpmPredictMultiplier);

			fuelTrimIntegral =	 (_fuelTrimIntegralTable[yIndexL * _config->RpmResolution + rpmIndexL] * (1 - yMultiplier) * (1 - rpmMultiplier)
								+ _fuelTrimIntegralTable[yIndexL * _config->RpmResolution + rpmIndexH] * (1 - yMultiplier) * rpmMultiplier
								+ _fuelTrimIntegralTable[yIndexH * _config->RpmResolution + rpmIndexL] * yMultiplier * (1 - rpmMultiplier)
								+ _fuelTrimIntegralTable[yIndexH * _config->RpmResolution + rpmIndexH] * yMultiplier * rpmMultiplier);
		
			_fuelTrim = fuelTrimIntegral;
			if (_config->IsPid)
			{
				fuelTrimIntegral *= 0.0078125;
				
				float derivative = (error - _lastError) / elapsedTime;
				
				_lastError = error;
				
				_fuelTrim = _config->P * error + fuelTrimIntegral - _config->D * derivative;
			}
		}
		else
		{
			_fuelTrim = 0;
		}
	}
}
#endif
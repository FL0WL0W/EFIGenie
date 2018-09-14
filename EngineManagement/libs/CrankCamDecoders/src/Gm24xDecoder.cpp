#include <stdint.h>
#include "CrankCamDecoders/Gm24xDecoder.h"

namespace CrankCamDecoders
{
	Gm24xDecoder::Gm24xDecoder(HardwareAbstraction::ITimerService *timerService)
	{
		_timerService = timerService;\
		_camTicked = false;
		_hasCamPosition = true;
		_isSynced = false;
		_lastCamTick   = 0;
		_lastCrankTick = 0;
		_crankPeriod   = 0;
		_state		   = 0;
		_crankState	   = 0;
	}
	
	unsigned int Gm24xDecoder::crankTime()
	{
		unsigned int crankTick = _timerService->GetTick();
		if (crankTick < _lastCrankTick)
		{
			return crankTick + (4294967295 - _lastCrankTick);
		}
		return crankTick - _lastCrankTick;
	}
	
	float Gm24xDecoder::GetCrankPosition(void)
	{
		return (_state % 24) * 15 + (crankTime() * 15.0) / _crankPeriod;
	}
	
	float Gm24xDecoder::GetCamPosition(void)
	{
		return _state * 15 + (crankTime() * 15.0) / _crankPeriod;
	}
	
	unsigned int Gm24xDecoder::GetTickPerDegree(void)
	{
		return _crankPeriod / 15;
	}
	
	unsigned short Gm24xDecoder::GetRpm(void)
	{
		return ((60 * _timerService->GetTicksPerSecond()) / 24) / _crankPeriod;
	}
	
	void Gm24xDecoder::CrankEdgeTrigger(EdgeTrigger edgeTrigger)
	{
		if (edgeTrigger == Down)
		{
			unsigned int crankTick = _timerService->GetTick();
			if (crankTick < _lastCrankTick)
			{
				_crankPeriod = crankTick + (4294967295 - _lastCrankTick);
			}
			else
			{
				_crankPeriod = crankTick - _lastCrankTick;
			}
			
			if ((_state != 0 && _state != 24) || (crankTick - _lastCamTick > (_crankPeriod >> 2) || (crankTick < _lastCamTick && crankTick + (4294967295 - _lastCamTick) > (_crankPeriod >> 2))))
			{
				_state++;
				if (_state > ((!_hasCamPosition && !_camTicked)? 23 : 47))
				{
					_state = 0;
					_hasCamPosition = _camTicked;
					_camTicked = false;
				}
			}
			
			_lastCrankTick = crankTick;
		}
		else if (edgeTrigger == Up && !_hasCamPosition)
		{
			unsigned int crankTick = _timerService->GetTick();
			unsigned int interumCrankPeriod = 0;
			if (crankTick < _lastCrankTick)
			{
				interumCrankPeriod = crankTick + (4294967295 - _lastCrankTick);
			}
			else
			{
				interumCrankPeriod = crankTick - _lastCrankTick;
			}
			
			if (interumCrankPeriod > _crankPeriod * 0.6)
			{
				//short pulse
				//    _
				//|__| |
				//   ^
				_crankState = 0;
				
			}
			else
			{
				//long pulse
				//   __
				//|_|  |
				//  ^
				_crankState++;
				if (_crankState == 5)
				{
					_state = 5;
					_isSynced = true;
				}
			}
		}
	}
	
	void Gm24xDecoder::CamEdgeTrigger(EdgeTrigger edgeTrigger)
	{
		_lastCamTick = _timerService->GetTick();
		_camTicked = true;
		_isSynced = true;
		_hasCamPosition = true;
		if (edgeTrigger == Down)
		{
			_state = 0;
		}
		if (edgeTrigger == Up)
		{
			_state = 24;
		}
	}
	
	bool Gm24xDecoder::IsSynced()
	{
		return _isSynced;
	}
	
	bool Gm24xDecoder::HasCamPosition()
	{
		return _hasCamPosition;
	}
}
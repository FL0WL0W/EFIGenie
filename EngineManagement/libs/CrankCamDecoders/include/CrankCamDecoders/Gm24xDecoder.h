#include "CrankCamDecoders/ICrankCamDecoder.h"
#include "HardwareAbstraction/ITimerService.h"

#ifndef GM24XDECODER_H
#define GM24XDECODER_H
namespace CrankCamDecoders
{
	class Gm24xDecoder : public ICrankCamDecoder
	{
	protected:
		unsigned char _state;
		unsigned char _crankState;
		bool _camTicked;
		bool _hasCamPosition;
		bool _isSynced;
		HardwareAbstraction::ITimerService *_timerService;
		unsigned int _lastCamTick;
		unsigned int _lastCrankTick;
		unsigned int _crankPeriod;
		unsigned int crankTime();
	public:
		Gm24xDecoder(HardwareAbstraction::ITimerService *timerService);
		float GetCrankPosition(void);
		float GetCamPosition(void);
		unsigned int GetTickPerDegree(void);
		unsigned short GetRpm(void);
		void CrankEdgeTrigger(EdgeTrigger edgeTrigger);
		void CamEdgeTrigger(EdgeTrigger edgeTrigger);
		bool IsSynced();
		bool HasCamPosition();
	};
}
#endif
#include "stdint.h"

#ifndef ICRANKCAMDECODER_H
#define ICRANKCAMDECODER_H
namespace CrankCamDecoders
{
	enum EdgeTrigger
	{
		Up,
		Down
	};
	
	class ICrankCamDecoder
	{
	public:
		virtual float GetCrankPosition(void) = 0; //refactor these into their own decoders for cam and crank. then move the logic to the ignition and injection scheduling service
		virtual float GetCamPosition(void) = 0;
		virtual uint32_t GetTickPerDegree(void) = 0;
		virtual unsigned short GetRpm(void) = 0;
		virtual bool IsSynced() = 0;
		virtual bool HasCamPosition() = 0;
	};
}
#endif
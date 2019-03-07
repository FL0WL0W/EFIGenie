#include "stdint.h"

#ifndef IRELUCTOR_H
#define IRELUCTOR_H
namespace Reluctor
{	
	class IReluctor
	{
	public:
		virtual float GetPosition() = 0;
		virtual uint32_t GetTickPerDegree() = 0;
		virtual uint16_t GetRpm() = 0;
		virtual uint16_t GetResolution() = 0;
		virtual bool IsSynced() = 0;
	};
}
#endif
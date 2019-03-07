#include "stdint.h"

#ifndef IANALOGSERVICE_H
#define IANALOGSERVICE_H
namespace HardwareAbstraction
{
	class IAnalogService
	{
	public:
		virtual void InitPin(uint16_t pin) = 0; //pin 0 should be for "null"
		virtual float ReadPin(uint16_t pin) = 0; //pin 0 should be for "null". returns voltage
	};
}
#endif

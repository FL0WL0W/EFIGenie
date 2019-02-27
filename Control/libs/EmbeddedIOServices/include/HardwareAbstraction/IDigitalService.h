#include "PinDirection.h"
#include "ICallBack.h"

#ifndef IDIGITALSERVICE_H
#define IDIGITALSERVICE_H
namespace HardwareAbstraction
{
	class IDigitalService
	{
	public:
		virtual void InitPin(uint16_t pin, PinDirection direction) = 0; //pin 0 should be for "null"
		virtual bool ReadPin(uint16_t pin) = 0; //pin 0 should be for "null"
		virtual void WritePin(uint16_t pin, bool value) = 0; //pin 0 should be for "null"
		virtual void ScheduleRecurringInterrupt(uint16_t pin, ICallBack *) = 0;
		virtual void ScheduleNextInterrupt(uint16_t pin, ICallBack *) = 0;
	};
}
#endif

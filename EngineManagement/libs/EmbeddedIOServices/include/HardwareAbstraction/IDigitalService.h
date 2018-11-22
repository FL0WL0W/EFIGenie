#include "PinDirection.h"
#include "ICallBack.h"

#ifndef IDIGITALSERVICE_H
#define IDIGITALSERVICE_H
namespace HardwareAbstraction
{
	class IDigitalService
	{
	public:
		virtual void InitPin(unsigned char pin, PinDirection direction) = 0; //pin 0 should be for "null"
		virtual bool ReadPin(unsigned char pin) = 0; //pin 0 should be for "null"
		virtual void WritePin(unsigned char pin, bool value) = 0; //pin 0 should be for "null"
		virtual void ScheduleRecurringInterrupt(unsigned char pin, ICallBack *) = 0;
		virtual void ScheduleNextInterrupt(unsigned char pin, ICallBack *) = 0;
	};
}
#endif
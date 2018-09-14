#ifndef IANALOGSERVICE_H
#define IANALOGSERVICE_H
namespace HardwareAbstraction
{
	class IAnalogService
	{
	public:
		virtual void InitPin(unsigned char pin) = 0; //pin 0 should be for "null"
		virtual float ReadPin(unsigned char pin) = 0; //pin 0 should be for "null". returns voltage
	};
}
#endif
#ifndef IPWMSERVICE_H
#define IPWMSERVICE_H
namespace HardwareAbstraction
{
	struct PwmValue
	{
		float Period;
		float PulseWidth;

		bool operator==(const PwmValue& rhs) const
		{
			return Period == rhs.Period
				&& PulseWidth == rhs.PulseWidth;
		}
	};

	class IPwmService
	{
	public:
		virtual void InitPin(unsigned short pin, PinDirection direction, unsigned short minFreqeuncy) = 0;  //pin 0 should be for "null"
		virtual PwmValue ReadPin(unsigned short pin) = 0; //pin 0 should be for "null"
		virtual void WritePin(unsigned short pin, PwmValue value) = 0; //pin 0 should be for "null"
	};
}
#endif
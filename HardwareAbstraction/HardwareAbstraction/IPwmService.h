namespace HardwareAbstraction
{
	struct PwmValue
	{
		float Period;
		float PulseWidth;
	};

	class IPwmService
	{
	public:
		virtual void InitPin(uint8_t pin, PinDirection direction) = 0;
		virtual PwmValue ReadPin(uint8_t pin) = 0;
		virtual void WritePin(uint8_t pin, PwmValue value) = 0;
	};
}
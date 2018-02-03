namespace HardwareAbstraction
{
	class IAnalogService
	{
	public:
		virtual void InitPin(uint8_t pin) = 0;
		virtual unsigned short ReadPin(uint8_t pin) = 0;
	};
}
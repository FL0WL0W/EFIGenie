namespace Stm32
{
	class Stm32F10xPwmService : public HardwareAbstraction::IPwmService
	{
	public:
		void InitPin(unsigned char pin, HardwareAbstraction::PinDirection direction);
		HardwareAbstraction::PwmValue ReadPin(unsigned char pin);
		void WritePin(unsigned char pin, HardwareAbstraction::PwmValue value);
	};
}
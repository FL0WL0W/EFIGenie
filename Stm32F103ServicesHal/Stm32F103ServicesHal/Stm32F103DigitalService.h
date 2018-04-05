namespace Stm32
{
	class Stm32F103DigitalService : public HardwareAbstraction::IDigitalService
	{
	public:
		void InitPin(unsigned char pin, HardwareAbstraction::PinDirection direction);
		bool ReadPin(unsigned char pin);
		void WritePin(unsigned char pin, bool value);
	};
}
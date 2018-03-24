namespace Stm32
{
	class Stm32F103DigitalService : public HardwareAbstraction::IDigitalService
	{
	public:
		void InitPin(uint8_t pin, HardwareAbstraction::PinDirection direction);
		bool ReadPin(uint8_t pin);
		void WritePin(uint8_t pin, bool value);
	};
}
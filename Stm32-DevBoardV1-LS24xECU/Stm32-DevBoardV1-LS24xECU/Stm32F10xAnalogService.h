namespace Stm32
{
	class Stm32F10xAnalogService : public HardwareAbstraction::IAnalogService
	{
	public:
		Stm32F10xAnalogService();
		void InitPin(uint8_t pin);
		float ReadPin(uint8_t pin);
	};
}
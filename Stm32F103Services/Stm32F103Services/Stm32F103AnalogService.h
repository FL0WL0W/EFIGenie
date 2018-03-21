namespace Stm32
{
	class Stm32F103AnalogService : public HardwareAbstraction::IAnalogService
	{
	public:
		Stm32F103AnalogService();
		void InitPin(uint8_t pin);
		float ReadPin(uint8_t pin);
	};
}
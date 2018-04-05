namespace Stm32
{
	class Stm32F103AnalogService : public HardwareAbstraction::IAnalogService
	{
	public:
		Stm32F103AnalogService();
		void InitPin(unsigned char pin);
		float ReadPin(unsigned char pin);
	};
}
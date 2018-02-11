namespace HardwareAbstraction
{
	class IAnalogService
	{
	public:
		virtual void InitPin(unsigned char pin) = 0;
		virtual float ReadPin(unsigned char pin) = 0;
	};
}
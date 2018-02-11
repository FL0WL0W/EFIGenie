namespace HardwareAbstraction
{
	class IDigitalService
	{
	public:
		virtual void InitPin(unsigned char pin, PinDirection direction) = 0;
		virtual bool ReadPin(unsigned char pin) = 0;
		virtual void WritePin(unsigned char pin, bool value) = 0;
	};
}
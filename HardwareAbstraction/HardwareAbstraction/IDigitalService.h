namespace HardwareAbstraction
{
	enum PinDirection
	{
		In  = 0,
		Out = 1
	};
	
	class IDigitalService
	{
	public:
		virtual void InitPin(uint8_t pin, PinDirection direction) = 0;
		virtual bool ReadPin(uint8_t pin) = 0;
		virtual void WritePin(uint8_t pin, bool value) = 0;
	};
}
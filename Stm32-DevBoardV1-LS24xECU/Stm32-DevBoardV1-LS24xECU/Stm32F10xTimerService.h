namespace Stm32
{
	class Stm32F10xTimerService : public HardwareAbstraction::ITimerService
	{
	private:
		unsigned int _tick = 0;
		unsigned int _callTick = 0;
		bool _futureTick = false;
		bool _futureTock = false;
		void ReturnCallBack(void);
		void ScheduleCallBack(unsigned int tick);
	public:
		Stm32F10xTimerService();
		void Interrupt(void);
		unsigned int GetTick(void);
		unsigned int GetTicksPerSecond(void);
	};
}
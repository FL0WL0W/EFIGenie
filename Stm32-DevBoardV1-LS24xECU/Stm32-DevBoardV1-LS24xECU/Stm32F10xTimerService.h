namespace Stm32
{
	class Stm32F10xTimerService : public HardwareAbstraction::ITimerService
	{
	private:
		unsigned int _tick = 0;
		unsigned int _callTick = 0;
		bool _futureTick = false;
		bool _futureTock = false;
		std::function<void(unsigned int)> _callBack;
		void ReturnCallBack(void);
	public:
		Stm32F10xTimerService();
		void Interrupt(void);
		void SetCallBack(std::function<void(unsigned int)> callBack);
		void ScheduleCallBack(unsigned int tick);
		unsigned int GetTick(void);
		unsigned int GetTicksPerSecond(void);
	};
}
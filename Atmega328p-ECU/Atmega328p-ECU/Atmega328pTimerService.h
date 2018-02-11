class Atmega328pTimerService : public HardwareAbstraction::ITimerService
{
	void ScheduleCallBack(unsigned int tick);
	unsigned int GetTick(void);
	unsigned int GetTicksPerSecond();
};
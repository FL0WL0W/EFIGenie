#ifndef IFUELPUMPSERVICE_H
#define IFUELPUMPSERVICE_H
namespace EngineControlServices
{
	class IFuelPumpService
	{
	public:
		virtual void Prime() = 0;
		virtual void On() = 0;
		virtual void Off() = 0;
		virtual void Tick() = 0;

		static void TickCallBack(void *fuelPumpService);
		static void PrimeCallBack(void *fuelPumpService);
		static void OnCallBack(void *fuelPumpService);
		static void OffCallBack(void *fuelPumpService);
	};
}
#endif
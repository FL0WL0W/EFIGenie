#ifndef IFUELTRIMSERVICE_H
#define IFUELTRIMSERVICE_H
namespace EngineControlServices
{
	class IFuelTrimService
	{
	public:
		virtual float GetFuelTrim(unsigned char cylinder) = 0;
		virtual void Tick() = 0;

		static void TickCallBack(void *fuelTrimService);
	};
}
#endif

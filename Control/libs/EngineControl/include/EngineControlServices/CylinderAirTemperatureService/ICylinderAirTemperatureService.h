#ifndef ICYLINDERAIRTEMPERATURESERVICE_H
#define ICYLINDERAIRTEMPERATURESERVICE_H
namespace EngineControlServices
{			
	class ICylinderAirTemperatureService
	{
	public:
		float *CylinderAirTemperature; //CylinderAirTemperature[Cylinder] g
		virtual void CalculateAirTemperature() = 0;
	};
}
#endif
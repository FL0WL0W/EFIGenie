#ifndef ICYLINDERAIRMASSSERVICE_H
#define ICYLINDERAIRMASSSERVICE_H
namespace EngineControlServices
{			
	class ICylinderAirmassService
	{
	public:
		float *CylinderAirmass = 0; //CylinderAirmass[Cylinder] g
		virtual void CalculateAirmass() = 0;
	};
}
#endif